import fs from 'fs';

async function testVariousImg2ImgEndpoints() {
  console.log('Testing image-to-image / inpainting endpoints...');

  // Test HuggingFace free inference models for InstructPix2Pix / ControlNet / Interior Design
  const hfModels = [
    'timbrooks/instruct-pix2pix',
    'fudan-generative-ai/huanhu-interior',
    'diffusers/controlnet-canny-sdxl-1.0',
    'stabilityai/stable-diffusion-xl-refiner-1.0',
  ];

  for (const model of hfModels) {
    try {
      console.log(`Checking HF model: ${model}`);
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: 'make it modern luxury interior design' }),
        signal: AbortSignal.timeout(5000),
      });
      console.log(`HF ${model} status:`, res.status);
    } catch (e) {
      console.log(`HF ${model} error:`, e.message);
    }
  }
}

testVariousImg2ImgEndpoints();
