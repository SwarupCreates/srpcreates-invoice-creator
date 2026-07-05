/**
 * Auth handles GitHub OAuth token exchange for the production app.
 */

function exchangeGithubCode(payload) {
  const code = payload.data ? payload.data.code : null;
  
  if (!code) {
    return Response.error('Missing GitHub code', 400);
  }

  // To secure this, you should set these in your Google Apps Script Script Properties
  const scriptProperties = PropertiesService.getScriptProperties();
  const clientId = scriptProperties.getProperty('GITHUB_CLIENT_ID');
  const clientSecret = scriptProperties.getProperty('GITHUB_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    return Response.error('Server is missing OAuth credentials in Script Properties', 500);
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
      return Response.error('GitHub token exchange failed: ' + JSON.stringify(tokenData), 400);
    }

    const profileResponse = UrlFetchApp.fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const profileData = JSON.parse(profileResponse.getContentText());
    
    if (!profileData.login || !profileData.avatar_url) {
      return Response.error('Failed to fetch profile from GitHub', 500);
    }
    
    // Return the profile data back to the React app cleanly!
    return Response.success({
      login: profileData.login,
      avatar_url: profileData.avatar_url
    });
    
  } catch (error) {
    return Response.error('OAuth Failed: ' + error.message, 500);
  }
}
