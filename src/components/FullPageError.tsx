interface FullPageErrorProps {
  title: string;
  message: string;
}

export const FullPageError = ({ message, title }: FullPageErrorProps) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="stylesheet" href="/static/styles/index.css">
    </head>
    <body>
      <div class="container">
        <h1>${title}</h1>
        <p>${message}</p>
        <button onclick="window.close()" class="btn btn-outline-secondary">Close Window</button>
      </div>
    </body>
    </html>`;
}