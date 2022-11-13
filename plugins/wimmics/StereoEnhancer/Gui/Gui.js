import '../utils/webaudio-controls.js'

      const getBaseURL = () => {
        const base = new URL('.', import.meta.url);
        return `${base}`;
      };
      export default class StereoEnhancerGui extends HTMLElement {
              constructor(plug) {
                 
        super();
            this._plug = plug;
            this._plug.gui = this;
        console.log(this._plug);
          
        this._root = this.attachShadow({ mode: 'open' });
        this._root.innerHTML = `<style>.my-pedal {animation:none 0s ease 0s 1 normal none running;appearance:none;background:rgb(128, 128, 128) url("https://mainline.i3s.unice.fr/fausteditorweb/dist/PedalEditor/Front-End/img/background/psyche6.jpg") repeat scroll 0% 0% / 100% 100% padding-box border-box;border:1px solid rgb(73, 73, 73);bottom:253.231px;clear:none;clip:auto;color:rgb(33, 37, 41);columns:auto auto;contain:none;container:none;content:normal;cursor:auto;cx:0px;cy:0px;d:none;direction:ltr;display:block;fill:rgb(0, 0, 0);filter:none;flex:0 1 auto;float:none;font:16px / 24px -apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";gap:normal;grid:none / none / none / row / auto / auto;height:283.788px;hyphens:manual;inset:58.1813px 592.894px 253.231px 212px;isolation:auto;left:212px;margin:2px;marker:none;mask:none;offset:none 0px auto 0deg;opacity:1;order:0;orphans:2;outline:rgb(33, 37, 41) none 0px;overflow:visible;padding:1px;page:auto;perspective:none;position:unset;quotes:auto;r:0px;resize:none;right:592.894px;rotate:none;rx:auto;ry:auto;scale:none;speak:normal;stroke:none;top:58.1813px;transform:matrix(1, 0, 0, 1, 0, 0);transition:all 0s ease 0s;translate:none;visibility:visible;widows:2;width:212.706px;x:0px;y:0px;zoom:1;};</style>
<div id="StereoEnhancer" class="resize-drag my-pedal gradiant-target" style="border: 1px solid rgb(73, 73, 73); text-align: center; display: inline-block; vertical-align: baseline; padding: 1px; margin: 2px; box-sizing: border-box; background-size: 100% 100%; box-shadow: rgba(0, 0, 0, 0.7) 4px 5px 6px, rgba(0, 0, 0, 0.2) -2px -2px 5px 0px inset, rgba(255, 255, 255, 0.2) 3px 1px 1px 4px inset, rgba(0, 0, 0, 0.9) 1px 0px 1px 0px, rgba(0, 0, 0, 0.9) 0px 2px 1px 0px, rgba(0, 0, 0, 0.9) 1px 1px 1px 0px; border-radius: 15px; background-color: grey; touch-action: none; width: 212.706px; position: relative; top: 0px; left: 0px; height: 283.793px; transform: translate(0px, 0px); background-image: url(&quot;./img/background/psyche6.jpg&quot;);" data-x="0" data-y="0"><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 33px; left: 15.2563px; transform: translate(14.4186px, -15.6495px);" data-x="14.418624877929688" data-y="-15.649459838867188"><webaudio-knob id="/StereoEnhancer/Delay_width" src="./img/knobs/Aqua.png" sprites="100" min="0" max="1" step="0.01" width="51" height="51" style="touch-action: none; display: block;"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/Aqua.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -1173px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1003.79px; top: -36.5px;">0.23</div>
</webaudio-knob></div><div class="drag" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 113.5px; left: 1px; transform: translate(114.106px, -96.39px);" data-x="114.10588073730469" data-y="-96.3900375366211"><webaudio-knob id="/StereoEnhancer/Frequency_width" src="./img/knobs/Aqua.png" sprites="100" min="0" max="1" step="0.01" width="51" height="51" style="touch-action: none; display: block;"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-knob{
  display:inline-block;
  position:relative;
  margin:0;
  padding:0;
  cursor:pointer;
  font-family: sans-serif;
  font-size: 11px;
}
.webaudio-knob-body{
  display:inline-block;
  position:relative;
  z-index:1;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-knob-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/knobs/Aqua.png&quot;); background-size: 51px 5151px; outline: none; width: 51px; height: 51px; background-position: 0px -4998px; transform: rotate(0deg);"></div><div class="webaudioctrl-tooltip" style="display: inline-block; width: auto; height: auto; transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden; left: 1003.79px; top: -36.5px;">0.98</div>
</webaudio-knob></div><div class="drag target-style" style="padding: 1px; margin: 1px; text-align: center; display: inline-block; box-sizing: border-box; touch-action: none; position: absolute; top: 218px; left: 25.5px; transform: translate(35.4968px, -12.8498px);" data-x="35.496826171875" data-y="-12.849761962890625"><webaudio-switch id="/StereoEnhancer/bypass" src="./img/switches/switch_1.png" sprites="100" width="68" height="37" style="touch-action: none;"><style>

.webaudioctrl-tooltip{
  display:inline-block;
  position:absolute;
  margin:0 -1000px;
  z-index: 999;
  background:#eee;
  color:#000;
  border:1px solid #666;
  border-radius:4px;
  padding:5px 10px;
  text-align:center;
  left:0; top:0;
  font-size:11px;
  opacity:0;
  visibility:hidden;
}
.webaudioctrl-tooltip:before{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -8px;
	border: 8px solid transparent;
	border-top: 8px solid #666;
}
.webaudioctrl-tooltip:after{
  content: "";
	position: absolute;
	top: 100%;
	left: 50%;
 	margin-left: -6px;
	border: 6px solid transparent;
	border-top: 6px solid #eee;
}

webaudio-switch{
  display:inline-block;
  margin:0;
  padding:0;
  font-family: sans-serif;
  font-size: 11px;
  cursor:pointer;
}
.webaudio-switch-body{
  display:inline-block;
  margin:0;
  padding:0;
}
</style>
<div class="webaudio-switch-body" tabindex="1" touch-action="none" style="background-image: url(&quot;./img/switches/switch_1.png&quot;); background-size: 100% 200%; width: 68px; height: 37px; outline: none; background-position: 0px 0px;"><div class="webaudioctrl-tooltip" style="transition: opacity 0.1s ease 0s, visibility 0.1s ease 0s; opacity: 0; visibility: hidden;"></div></div>
</webaudio-switch></div><label for="StereoEnhancer" style="display: block; touch-action: none; position: absolute; z-index: 1; width: 150px; left: 2px; top: 4.18125px; transform: translate(28.3515px, 129.177px); border: none; font-family: Monoton; color: rgb(43, 255, 0); font-size: 20px; -webkit-text-stroke: 0px rgb(0, 0, 0);" class="drag" contenteditable="false" data-x="28.351531982421875" data-y="129.17699432373047" font="Monoton">Stereo<br>Enhancer</label><label for="Delay width" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 84.4813px; left: 18.2563px; top: 82.6813px; border: none; transform: translate(-3.51572px, -12.9439px); font-family: Monoton; color: rgb(43, 255, 0); font-size: 14px;" class="drag" contenteditable="false" data-x="-3.515716552734375" data-y="-12.943939208984375" font="Monoton">Delay</label><label for="Frequency width" style="text-align: center; display: block; touch-action: none; position: absolute; z-index: 1; width: 113px; left: 4px; top: 163.181px; transform: translate(81.4074px, -93.0772px); border: none; font-family: Monoton; color: rgb(43, 255, 0); font-size: 14px;" class="drag" contenteditable="false" data-x="81.40740966796875" data-y="-93.07720947265625" font="Monoton">Frequency</label><label for="bypass" style="text-align: center; display: none; touch-action: none; position: absolute; z-index: 1; width: 64px; left: 28.5px; top: 269.181px; border: none; font-family: Monoton; color: rgb(43, 255, 0);" class="drag" contenteditable="false" font="Monoton">bypass</label></div>`;
  
        this.isOn;
            this.state = new Object();
            this.setKnobs();
            this.setSliders();
            this.setSwitches();
            //this.setSwitchListener();
            this.setInactive();
            // Change #pedal to .my-pedal for use the new builder
            this._root.querySelector('.my-pedal').style.transform = 'none';
            //this._root.querySelector("#test").style.fontFamily = window.getComputedStyle(this._root.querySelector("#test")).getPropertyValue('font-family');
  
            // Compute base URI of this main.html file. This is needed in order
            // to fix all relative paths in CSS, as they are relative to
            // the main document, not the plugin's main.html
            this.basePath = getBaseURL();
            console.log("basePath = " + this.basePath)
  
            // Fix relative path in WebAudio Controls elements
            this.fixRelativeImagePathsInCSS();
  
            // optionnal : set image background using a relative URI (relative
            // to this file)
        //this.setImageBackground("/img/BigMuffBackground.png");
          
        // Monitor param changes in order to update the gui
        window.requestAnimationFrame(this.handleAnimationFrame);
      
              }
          
              fixRelativeImagePathsInCSS() {
                 
      // change webaudiocontrols relative paths for spritesheets to absolute
          let webaudioControls = this._root.querySelectorAll(
              'webaudio-knob, webaudio-slider, webaudio-switch, img'
          );
          webaudioControls.forEach((e) => {
              let currentImagePath = e.getAttribute('src');
              if (currentImagePath !== undefined) {
                  //console.log("Got wc src as " + e.getAttribute("src"));
                  let imagePath = e.getAttribute('src');
                  e.setAttribute('src', this.basePath + '/' + imagePath);
                  //console.log("After fix : wc src as " + e.getAttribute("src"));
              }
          });
  
          let sliders = this._root.querySelectorAll('webaudio-slider');
          sliders.forEach((e) => {
              let currentImagePath = e.getAttribute('knobsrc');
              if (currentImagePath !== undefined) {
                  let imagePath = e.getAttribute('knobsrc');
                  e.setAttribute('knobsrc', this.basePath + '/' + imagePath);
              }
          });

          // BMT Get all fonts
          // Need to get the attr font
          let usedFonts = "";
          let fonts = this._root.querySelectorAll('label[font]');
          fonts.forEach((e) => {
              if(!usedFonts.includes(e.getAttribute("font"))) usedFonts += "family=" + e.getAttribute("font") + "&";
          });
          let link = document.createElement('link');
          link.rel = "stylesheet";
          if(usedFonts.slice(0, -1)) link.href = "https://fonts.googleapis.com/css2?"+usedFonts.slice(0, -1)+"&display=swap";
          document.querySelector('head').appendChild(link);
          
          // BMT Adapt for background-image
          let divs = this._root.querySelectorAll('div');
          divs.forEach((e) => {
              if('background-image' in e.style){
                let currentImagePath = e.style.backgroundImage.slice(4, -1);
                if (currentImagePath !== undefined) {
                    let imagePath = e.style.backgroundImage.slice(5, -2);
                    if(imagePath != "") e.style.backgroundImage = 'url(' + this.basePath + '/' + imagePath + ')';
                }
              }
          });
          
              }
          
              setImageBackground() {
                 
      // check if the shadowroot host has a background image
          let mainDiv = this._root.querySelector('#main');
          mainDiv.style.backgroundImage =
              'url(' + this.basePath + '/' + imageRelativeURI + ')';
  
          //console.log("background =" + mainDiv.style.backgroundImage);
          //this._root.style.backgroundImage = "toto.png";
      
              }
          
              attributeChangedCallback() {
                 
            console.log('Custom element attributes changed.');
            this.state = JSON.parse(this.getAttribute('state'));
        let tmp = '/PingPongDelayFaust/bypass';
        
        if (this.state[tmp] == 1) {
          this._root.querySelector('#switch1').value = 0;
          this.isOn = false;
        } else if (this.state[tmp] == 0) {
          this._root.querySelector('#switch1').value = 1;
          this.isOn = true;
        }
  
        this.knobs = this._root.querySelectorAll('.knob');
        console.log(this.state);
  
        for (var i = 0; i < this.knobs.length; i++) {
          this.knobs[i].setValue(this.state[this.knobs[i].id], false);
          console.log(this.knobs[i].value);
        }
      
              }
          handleAnimationFrame = () => {
        this._root.getElementById('/StereoEnhancer/Delay_width').value = this._plug.audioNode.getParamValue('/StereoEnhancer/Delay_width');
        

        this._root.getElementById('/StereoEnhancer/Frequency_width').value = this._plug.audioNode.getParamValue('/StereoEnhancer/Frequency_width');
        

          this._root.getElementById('/StereoEnhancer/bypass').value = 1 - this._plug.audioNode.getParamValue('/StereoEnhancer/bypass');
         
window.requestAnimationFrame(this.handleAnimationFrame);
         }
      
              get properties() {
                 
        this.boundingRect = {
            dataWidth: {
              type: Number,
              value: null
            },
            dataHeight: {
              type: Number,
              value: null
            }
        };
        return this.boundingRect;
      
              }
          
              static get observedAttributes() {
                 
        return ['state'];
      
              }
          
              setKnobs() {
                 this._root.getElementById("/StereoEnhancer/Delay_width").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/StereoEnhancer/Delay_width", e.target.value));
this._root.getElementById("/StereoEnhancer/Frequency_width").addEventListener("input", (e) =>this._plug.audioNode.setParamValue("/StereoEnhancer/Frequency_width", e.target.value));

              }
          
              setSliders() {
                 
              }
          
              setSwitches() {
                 this._root.getElementById("/StereoEnhancer/bypass").addEventListener("change", (e) =>this._plug.audioNode.setParamValue("/StereoEnhancer/bypass", 1 - e.target.value));

              }
          
              setInactive() {
                 
        let switches = this._root.querySelectorAll(".switch webaudio-switch");
  
        switches.forEach(s => {
          console.log("### SWITCH ID = " + s.id);
          this._plug.audioNode.setParamValue(s.id, 0);
        });
      
              }
          }
      try {
          customElements.define('wap-stereoenhancer', 
                                StereoEnhancerGui);
          console.log("Element defined");
      } catch(error){
          console.log(error);
          console.log("Element already defined");      
      }
      