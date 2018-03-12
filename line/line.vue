<template>
  <div class="main">
	  <svg xmlns="http://www.w3.org/2000/svg" :width=width :height=height version="1.1">
      <text :x="width/2" y="21" :fill="titleColor" font-size=16 text-anchor="middle" v-if="title">{{title}}</text>
      <g>
        <g v-for="item in rowLine">
          <text :x="item.x1-8" :y=item.y1 dy="0.3em" text-anchor="end">{{item.label}}</text>
          <line :x1=item.x1 :y1=item.y1 :x2=item.x2 :y2=item.y2 :stroke="lineColor" stroke-width="1"></line>
        </g>
      </g>
      <g>
        <polyline v-for="(item,key) in pathList" class="" :points=item.path fill=transparent :stroke-width="item.hover?3:1" :stroke=item.color></polyline>
      </g>
      <g>
        <g v-for="(item,key) in columnLine">
          <text :x=item.labelX :y=item.labelY text-anchor="middle">{{item.label}}</text>
          <line :x1=item.line.x1 :y1=item.line.y1 :x2=item.line.x2 :y2=item.line.y2 stroke-width="1" :stroke="lineColor" v-show=item.hover></line>
          <rect :x=item.rectX :y=item.rectY :width=item.rectWidth :height=item.rectHeight fill=transparent
          @mouseenter=rectMouseEnter(key,$event) @mouseleave=rectMouseLeave(key,$event) @mousemove=rectMouseMove></rect>
        </g>
      </g>

      <g>
        <g v-for="(item,key) in pathList" class="curpoint" @mouseenter=labelMouseEnter(key,$event) @mouseleave=labelMouseLeave(key,$event)>
          <rect height="20" width="20" :fill=item.color x="10" :y="key*30+10"></rect>
          <rect height="20" width="10" x="30" :y="key*30+10" fill=transparent stroke=transparent></rect>
          <text x="40" :y="key*30+10" dy="1em" :font-size=15 :fill=labelColor>{{item.label}}</text>
        </g>
      </g>
		</svg>
    <div class="tip" :style="{top:tip.top+'px',left:tip.left+'px'}" v-show="tip.show" v-if="showTip" v-html=tip.msg></div>
  </div>
</template>
<script>
export default {
  name:'i-line',
  data(){
    return {
      colorList:['#19d4ae', '#5ab1ef', '#fa6e86','#ffb980', '#0067a6', '#c4b4e4','#d87a80', '#9cbbff', '#d9d0c7','#87a997', '#d49ea2', '#5b4947'],
      list:[],
      labelList:[],
      tip:{
        show:false,
        top:0,
        left:0,
        msg:null
      }
    }
  },
  props:{
  	data:{
      type:Array,
      required:true
    },
    label:{
      type:Array,
      required:true
    },
  	title:String,
  	width:{
  		type:Number,
  		default:500
  	},
  	height:{
  		type:Number,
  		default:400
  	},
    padding:{
      type:Array,
      default:function(){
        return [50,0,50,150]
      }
    },
    rowNum:{
      type:Number,
      required:true
    },
    max:{
      type:Number,
      required:true
    },
    min:{
      type:Number,
      default:0
    },
    showTip:{
      type:Boolean,
      default:true
    },
    showLegend:{
      type:Boolean,
      default:true
    },
    titleColor:{
      default:'#000'
    },
    labelColor:{
      default:'#000'
    },
    lineColor:{
      default:'#d8d8d8'
    }
  },
  computed:{
    origin:function(){
      return {
        x:this.tmpPadding[3],
        y:this.height-this.tmpPadding[2]
      }
    },
    grid:function(){
      return {
        width:(this.width-this.tmpPadding[1]-this.tmpPadding[3])/this.label.length,
        height:(this.height-this.tmpPadding[0]-this.tmpPadding[2])/(this.rowNum-1)
      }
    },
    tmpPadding:function(){
      let padding=this.padding,len=padding.length
      if(len==1){
        return Array(4).fill(padding[0])
      }else if(len==2){
        return [].concat(padding,padding)
      }else if(len==3){
        return [...padding,padding[1]]
      }else if(len==4){
        return padding
      }else{
        return Array(4).fill(0)
      }
    },
    rowLine:function(){
      let tmp=Array(this.rowNum).fill(false),height
      return tmp.map((v,i)=>{
        height=this.height-(this.origin.y-i*this.grid.height)-this.tmpPadding[2]+this.tmpPadding[0]
        return {
          x1:this.origin.x,
          y1:height,
          x2:this.width-this.tmpPadding[1],
          y2:height,
          label:this.max-i*(this.max-this.min)/(this.rowNum-1)
        }
      })
    },
    columnLine:function(){
      return this.labelList.map((v,i)=>{
        return {
          ...v,
          labelX:(2*i+1)*this.grid.width/2+this.origin.x,
          labelY:this.height-this.tmpPadding[2]+20,
          rectWidth:this.grid.width,
          rectHeight:this.height-this.tmpPadding[0]-this.tmpPadding[2],
          rectX:i*this.grid.width+this.origin.x,
          rectY:this.tmpPadding[0],
          line:{
            x1:(2*i+1)*this.grid.width/2+this.origin.x,
            y1:this.origin.y,
            x2:(2*i+1)*this.grid.width/2+this.origin.x,
            y2:this.tmpPadding[0]
          }
        }
      })
    },
    pathList:function(){
      let x,y,table_height=this.height-this.tmpPadding[0]-this.tmpPadding[2]
      return this.list.map(v=>{
        return {
          ...v,
          path:this.label.map((m,i)=>{
            x=(2*i+1)*this.grid.width/2+this.origin.x
            y=this.origin.y-table_height*(v.data[i]-this.min)/(this.max-this.min)
            return x+','+y
          }).join(' ')
        }
      })
    }
  },
  created(){
    this.setList()
    this.setLabelList()
  },
  watch:{
    data:function(){
      this.setList()
    },
    label:function(){
      this.setLabelList()
    }
  },
  methods:{
    setList(){
      this.list=this.data.map((v,index)=>({
        ...v,
        hover:false,
        color:v.color||this.colorList[index%12]
      }))
    },
    setLabelList(){
      this.labelList=this.label.map(v=>({
        label:v,
        hover:false
      }))
    },
    labelMouseEnter(key,event){
      this.$set(this.list[key],'hover',true)
      this.$emit('labelMouseEnter',event)
    },
    labelMouseLeave(key,event){
      this.$set(this.list[key],'hover',false)
      this.$emit('labelMouseLeave',event)
    },
    rectMouseEnter(key,event){
      if(this.showTip){
        this.tip.show=true
        this.tip.msg='<p>'+this.labelList[key].label+'</p>'
        this.tip.msg+=this.list.map(v=>'<p><span style="background:'+v.color+'"></span>'+v.label+'：'+v.data[key]+'</p>').join('')
      }
      this.$set(this.labelList[key],'hover',true)
      this.$emit('rectMouseEnter',event)
    },
    rectMouseLeave(key,event){
      if(this.showTip){
        this.tip.show=false
      }
      this.$set(this.labelList[key],'hover',false)
      this.$emit('rectMouseLeave',event)
    },
    rectMouseMove(e){
      if(this.showTip){
        this.tip.top=e.offsetY+10
        this.tip.left=e.offsetX+30
      }
    }
  }
}
</script>

<style scoped>
  .main{
    position: relative
  }
  .curpoint{
    cursor: pointer;
  }
  .tip{
    position: absolute;
    padding: 5px 10px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    border-radius: 5px;
    z-index: 100000
  }
  .tip>>>p{
    display: flex;
    align-items: center
  }
  .tip>>>p span{
    height: 10px;width: 10px;
    margin-right: 5px;
    border-radius:50%
  }
</style>
