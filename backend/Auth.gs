/**
 * Auth handles GitHub OAuth token exchange for the production app.
 */

function handleGithubCallback(e) {
  const code = e.parameter.code;
  
  if (!code) {
    return HtmlService.createHtmlOutput('<h1>Error: Missing GitHub code</h1>');
  }

  // To secure this, you should set these in your Google Apps Script Script Properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const clientId = scriptProperties.getProperty('GITHUB_CLIENT_ID');
  const clientSecret = scriptProperties.getProperty('GITHUB_CLIENT_SECRET');
  
  // This is the URL of your frontend GitHub pages deployment. 
  // Make sure to add this in Script Properties!
  const frontendUrl = scriptProperties.getProperty('FRONTEND_URL');

  if (!clientId || !clientSecret || !frontendUrl) {
    return HtmlService.createHtmlOutput('<h1>Error: Server is missing OAuth credentials in Script Properties.</h1><p>Please add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, and FRONTEND_URL.</p>');
  }

  try {
    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      code: code
    };

    const options = {
      method: 'post',
      payload: JSON.stringify(payload),
      contentType: 'application/json',
      headers: {
        Accept: 'application/json'
      }
    };

    const response = UrlFetchApp.fetch('https://github.com/login/oauth/access_token', options);
    const tokenData = JSON.parse(response.getContentText());

    if (!tokenData.access_token) {
      return HtmlService.createHtmlOutput('<h1>Error: GitHub token exchange failed</h1><p>' + JSON.stringify(tokenData) + '</p>');
    }

    const profileResponse = UrlFetchApp.fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const profileData = JSON.parse(profileResponse.getContentText());
    
    if (!profileData.login || !profileData.avatar_url) {
      return HtmlService.createHtmlOutput('<h1>Error: Failed to fetch profile from GitHub</h1>');
    }

    // Now we must redirect the user back to the frontend with the profile info.
    // We pass the login and avatar_url in the URL. (access_token is intentionally omitted for security since we only need identity).
    
    const params = `?login=${encodeURIComponent(profileData.login)}&avatar=${encodeURIComponent(profileData.avatar_url)}`;
    const redirectUrl = frontendUrl + params;
    
    // Apps Script doesn't support 302 redirects back from doGet cleanly, 
    // but we can serve an HTML page that instantly redirects using JavaScript.
    const htmlOutput = `
      <!DOCTYPE html>
      <html>
        <head>
        </head>
        <body>
          <p>Redirecting to application...</p>
          <a id="redirectLink" href="${redirectUrl}" target="_top" style="display:none;">Continue</a>
          <script>
            document.getElementById('redirectLink').click();
          </script>
        </body>
      </html>
    `;
    
    return HtmlService.createHtmlOutput(htmlOutput);
    
  } catch (error) {
    return HtmlService.createHtmlOutput('<h1>OAuth Failed</h1><p>' + error.message + '</p>');
  }
}
