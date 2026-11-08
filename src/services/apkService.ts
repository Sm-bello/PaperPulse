/**
 * Service to query GitHub API for the latest release APK and trigger direct download
 */
export async function downloadLatestApkFromGitHub(
  owner: string = "Sm-bello",
  repo: string = "PaperPulse"
): Promise<{ success: boolean; version?: string; source: 'github' | 'local' }> {
  try {
    // Quietly ask GitHub for the latest release
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
      headers: {
        "Accept": "application/vnd.github.v3+json"
      }
    });

    if (res.ok) {
      const data = await res.json();
      const assets = data.assets || [];
      
      // Look for an asset ending in .apk
      const apkAsset = assets.find((a: any) => 
        (a.name && a.name.toLowerCase().endsWith('.apk')) ||
        a.content_type === 'application/vnd.android.package-archive'
      );

      if (apkAsset && apkAsset.browser_download_url) {
        // Direct download from GitHub release
        const a = document.createElement('a');
        a.href = apkAsset.browser_download_url;
        a.download = apkAsset.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return { success: true, version: data.tag_name || "latest", source: 'github' };
      }
    }
  } catch (err) {
    console.warn("GitHub API release check error, using packaged APK:", err);
  }

  // Fallback: download packaged APK from the web application
  const a = document.createElement('a');
  a.href = '/PaperPulse.apk';
  a.download = 'ScholaPulse-v2.0.apk';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return { success: true, version: "v2.0", source: 'local' };
}
