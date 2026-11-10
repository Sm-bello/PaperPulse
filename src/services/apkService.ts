/**
 * Service to safely download the verified Android APK
 * Uses same-origin direct binary streaming with GitHub Releases fallback
 */
export async function downloadLatestApkFromGitHub(
  owner: string = "Sm-bello",
  repo: string = "PaperPulse"
): Promise<{ success: boolean; version?: string; source: 'direct' | 'github' }> {
  try {
    // Primary: Trigger direct same-origin download from the verified web host
    // This avoids cross-domain 302 S3 redirects which trigger mobile browser warning dialogs
    const directUrl = '/ScholaPulse-v2.0.apk';
    const checkRes = await fetch(directUrl, { method: 'HEAD' });

    if (checkRes.ok && checkRes.status === 200) {
      const a = document.createElement('a');
      a.href = directUrl;
      a.download = 'ScholaPulse-v2.0.apk';
      a.setAttribute('rel', 'noopener noreferrer');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { success: true, version: "v2.0", source: 'direct' };
    }
  } catch (err) {
    console.warn("Direct APK check warning, querying GitHub Releases:", err);
  }

  // Secondary Fallback: Query GitHub API for the latest release asset
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: {
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (res.ok) {
      const data = await res.json();
      const assets = data.assets || [];
      
      const apkAsset = assets.find((a: any) => 
        (a.name && a.name.toLowerCase().endsWith('.apk')) ||
        a.content_type === 'application/vnd.android.package-archive'
      );

      if (apkAsset && apkAsset.browser_download_url) {
        const a = document.createElement('a');
        a.href = apkAsset.browser_download_url;
        a.download = apkAsset.name || 'ScholaPulse-v2.0.apk';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return { success: true, version: data.tag_name || "latest", source: 'github' };
      }
    }
  } catch (err) {
    console.warn("GitHub API release check error, triggering local fallback:", err);
  }

  // Final fallback
  const a = document.createElement('a');
  a.href = '/PaperPulse.apk';
  a.download = 'ScholaPulse-v2.0.apk';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return { success: true, version: "v2.0", source: 'direct' };
}
