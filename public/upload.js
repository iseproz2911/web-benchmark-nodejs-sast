const form = document.querySelector('#upload-form');
if (form) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const file = form.elements.attachment.files[0];
    const output = document.querySelector('#upload-result');
    if (!file) return;
    try {
      const response = await fetch('/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream', 'X-Filename': file.name },
        body: file,
      });
      if (!response.ok) throw new Error(await response.text());
      const result = await response.json();
      const link = document.createElement('a');
      link.href = result.url;
      link.textContent = 'Open uploaded attachment';
      output.replaceChildren(link);
    } catch (error) {
      output.textContent = error.message;
    }
  });
}
