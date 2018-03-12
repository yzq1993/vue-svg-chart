<template>
  <div class="main">
	  <svg xmlns="http://www.w3.org/2000/svg" :width=width :height=height version="1.1">
      <text v-if="title" :x="width/2" y="21" :fill="titleColor" font-size=16 text-anchor="middle" >{{title}}</text>
      <g v-for="(item,key) in pathList" class="curpoint" @mouseenter=labelMouseEnter(key,$event) @mouseleave=labelMouseLeave(key,$event)>
        <rect height="20" width="20" :fill=item.color x="10" :y="key*30+10"></rect>
        <rect height="20" width="10" x="30" :y="key*30+10" fill=transparent stroke=transparent ></rect>
        <text x="40" :y="key*30+10" dy="1em" font-size=15 :fill=labelColor>{{item.label}}</text>
      </g>
      <path v-for="(item,key) in pathList" :key=key :fill=item.color :d=item.d class="curpoint" @mouseenter=pathMouseEnter(key,$event) @mouseleave=pathMouseLeave(key,$event) @mousemove=pathMouseMove :style="{opacity:(item.hover?0.7:1)}"></path>
		</svg>
    <div class="tip" :style="{top:tip.top+'px',left:tip.left+'px'}" v-show="tip.show" v-if="showTip">{{tip.msg}}</div>
  </div>
</template>

<script>
export default {
  name:'i-doughnut',
  data(){
    return {
      tip:{
        show:false,
        top:0,
        left:0,
        msg:null
      },
      colorList:['#19d4ae', '#5ab1ef', '#fa6e86','#ffb980', '#0067a6', '#c4b4e4','#d87a80', '#9cbbff', '#d9d0c7','#87a997', '#d49ea2', '#5b4947'],
      list:[]
    }
  },
  props:{
    data:{
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
    centerX:Number,
    centerY:Number,
    hoverAnimation:{
      type:Boolean,
      default:true
    },
    showTip:{
      type:Boolean,
      default:true
    },
    radius:{
      type:Number,
      default:150
    },
    innerRadius:{
      type:Number,
      default:100
    },
    titleColor:{
      default:'#000'
    },
    labelColor:{
      default:'#000'
    }
  },
  computed:{
    center:function(){
      return {
        x:this.centerX||this.width/2,
        y:this.centerY||this.height/2
      }
    },
    pathList:function(){
      let total=this.list.reduce((m,n)=>m+n.value,0),
        cmd,startAngle=-Math.PI/2,endAngle,rotation,percent,radius;
      return this.list.map(v=>{
        percent=v.value/total
        rotation=percent*Math.PI*2
        endAngle=startAngle+rotation
        radius=v.r||this.radius
        cmd=this.setD({rotation:rotation,startAngle:startAngle,endAngle:endAngle,percent:percent,radius:radius,innerRadius:this.innerRadius})
        startAngle=endAngle
        return {
          ...v,
          d:cmd,
          rotation:rotation,
          radius:radius,
          startAngle:endAngle-rotation,
          endAngle:endAngle,
          percent:percent
        }
      })
    },
    option:function(){

    }
  },
  created(){
    this.setList()
  },
  watch:{
    data:function(){
      this.setList()
    }
  },
  methods:{
    setList(){
      this.list=this.data.map((v,index)=>({
        ...v,
        r:0,
        hover:false,
        color:v.color||this.colorList[index%12]
      }))
    },
    setD(obj){
      let tmp=[
        'M',this.center.x+Math.cos(obj.startAngle)*obj.radius,this.center.y+Math.sin(obj.startAngle)*obj.radius,
        'A',obj.radius,obj.radius,obj.rotation,(obj.percent>0.5?1:0),1,this.center.x+Math.cos(obj.endAngle)*obj.radius,this.center.y+Math.sin(obj.endAngle)*obj.radius,
        'L',this.center.x+Math.cos(obj.endAngle)*obj.innerRadius,this.center.y+Math.sin(obj.endAngle)*obj.innerRadius,
        'A',obj.innerRadius,obj.innerRadius,obj.rotation,(obj.percent>0.5?1:0),0,this.center.x+Math.cos(obj.startAngle)*obj.innerRadius,this.center.y+Math.sin(obj.startAngle)*obj.innerRadius,
        'L',this.center.x+Math.cos(obj.startAngle)*obj.innerRadius,this.center.y+Math.sin(obj.startAngle)*obj.innerRadius,
        'Z'
      ]
      return tmp.join(' ')
    },
    draw(key,r){
      if(this.hoverAnimation){
        this.$set(this.list[key],'r',r)
      }
    },
    labelMouseEnter(key,event){
      this.draw(key,this.radius+15)
      this.$set(this.list[key],'hover',true)
      this.$emit('labelMouseEnter',event)
    },
    labelMouseLeave(key,event){
      this.draw(key,this.radius)
      this.$set(this.list[key],'hover',false)
      this.$emit('labelMouseLeave',event)
    },
    pathMouseEnter(key,event){
      if(this.showTip){
        this.tip.show=true
        let obj=this.pathList[key]
        this.tip.msg=obj.label+'：'+obj.value+'（'+(obj.percent*100).toFixed(2)+' %）'
      }
      this.$set(this.list[key],'hover',true)
      this.draw(key,this.radius+15)
      this.$emit('pathMouseEnter',event)
    },
    pathMouseLeave(key,event){
      if(this.showTip){
        this.tip.show=false
      }
      this.$set(this.list[key],'hover',false)
      this.draw(key,this.radius)
      this.$emit('pathMouseLeave',event)
    },
    pathMouseMove(e){
      if(this.showTip){
        this.tip.top=e.offsetY+10
        this.tip.left=e.offsetX+30
      }
    }
  }
}
</script>
<style scoped>
  .curpoint{
    cursor: pointer;
  }
  .main{
    position: relative
  }
  .tip{
    position: absolute;
    padding: 5px 10px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    border-radius: 5px;
    z-index: 100000
  }
</style>
