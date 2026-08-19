async function inspectPollinationsOptions() {
  console.log('Inspecting Pollinations image options...');
  try {
    const res = await fetch('https://image.pollinations.ai/models', { signal: AbortSignal.timeout(5000) });
    console.log('Pollinations models status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Pollinations available models:', data);
    }
  } catch (e) {
    console.log('Pollinations models error:', e.message);
  }
}

inspectPollinationsOptions();
