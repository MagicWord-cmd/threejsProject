import {
	Color
} from 'three';
import { Pass } from 'three/addons/postprocessing/Pass.js';

//todo 为了同时实现EffectComposer和OutlineEffect，需要在RenderPass.js中引入OutlineEffect，避免后期处理被覆盖而只渲染的最后执行的渲染效果。
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

let effect;

class RenderPass extends Pass {

	constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.overrideMaterial = overrideMaterial;

		this.clearColor = clearColor;
		this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : 0;

		this.clear = true;
		this.clearDepth = false;
		this.needsSwap = false;
		this._oldClearColor = new Color();



	}

	render(renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */) {

		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		let oldClearAlpha, oldOverrideMaterial;

		if (this.overrideMaterial !== undefined) {

			oldOverrideMaterial = this.scene.overrideMaterial;

			this.scene.overrideMaterial = this.overrideMaterial;

		}

		if (this.clearColor) {

			renderer.getClearColor(this._oldClearColor);
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor(this.clearColor, this.clearAlpha);

		}

		if (this.clearDepth) {

			renderer.clearDepth();

		}

		renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);

		// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
		if (this.clear) renderer.clear(renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil);
		renderer.render(this.scene, this.camera);

		if (this.clearColor) {

			renderer.setClearColor(this._oldClearColor, oldClearAlpha);

		}

		if (this.overrideMaterial !== undefined) {

			this.scene.overrideMaterial = oldOverrideMaterial;

		}

		renderer.autoClear = oldAutoClear;

		//todo 这里执行OutlineEffect的渲染效果
		effect = new OutlineEffect(renderer, {

			defaultThickness: 0.001,	//轮廓线宽
			defaultColor: [0, 0, 0],	//轮廓线的颜色
			defaultAlpha: 0.8,			//轮廓线的透明度
			defaultKeepAlive: true		// keeps outline material in cache even if material is removed from scene

		})
		effect.render(this.scene, this.camera);

	}

}

export { RenderPass };
