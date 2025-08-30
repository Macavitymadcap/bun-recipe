import { Alert, AlertProps } from "../Alert";

interface UploadRecipesResponseProps {
  alert: AlertProps;
  details?: {
    imported: number;
    skipped: number;
    errors: number;
    messages: string[];
  };
}

export const UploadRecipesResponse = ({
  alert,
  details
}: UploadRecipesResponseProps) => {
  const detailsHtml = details ? `
    <article class="card mt-3">
      <div class="card-header">
        <h3>Upload Summary</h3>
      </div>
      <div class="card-body">
        <div class="grid">
          <div class="col-4">
            <strong>Imported:</strong> ${details.imported}
          </div>
          <div class="col-4">
            <strong>Skipped:</strong> ${details.skipped}
          </div>
          <div class="col-4">
            <strong>Errors:</strong> ${details.errors}
          </div>
        </div>
        
        ${details.messages.length > 0 ? `
          <details class="mt-3">
            <summary><strong>Detailed Messages (${details.messages.length})</strong></summary>
            <div class="content">
              <ul>
                ${details.messages.map(msg => `<li>${msg}</li>`).join('')}
              </ul>
            </div>
          </details>
        ` : ''}
      </div>
    </article>
  ` : '';

  return `
    <div hx-swap-oob="beforeend:#alerts">
      ${Alert(alert)}
    </div>
    ${detailsHtml}
  `;
};