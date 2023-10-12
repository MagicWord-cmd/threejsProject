precision lowp float;

varying vec4 vPosition;
varying vec4 gPosition;
void main(){
    vec4 redColor=vec4(1.,0.,0.,1.);
    vec4 yellowColor=vec4(1.,1.,0.,1.);
    vec4 minxColor=mix(yellowColor,redColor,gPosition.y/3.);
    if(gl_FrontFacing){
        gl_FragColor=vec4(minxColor.xyz-vPosition.y/100.-.1,1.);
        
    }else{
        gl_FragColor=vec4(minxColor.xyz,1.);
    }
}
