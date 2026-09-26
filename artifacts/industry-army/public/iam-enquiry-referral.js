(function () {
  // Carry a referring label into the enquiry, never a private URL or query string.
  var params = new URLSearchParams(window.location.search);
  var site = params.get('ref_site') || (params.get('iamref') || '').split('|')[0] || params.get('utm_source') || '';
  if (!site && document.referrer) {
    try {
      var host = new URL(document.referrer).hostname;
      if (host !== window.location.hostname && !/^(www\.)?industryarmymarketing\.com$/.test(host)) site = host;
    } catch (_) {}
  }
  try {
    if (!site) site = JSON.parse(sessionStorage.getItem('iam-enquiry-referral') || '{}').site || '';
  } catch (_) {}
  site = String(site).replace(/[\r\n<>]/g, '').trim().slice(0, 120);
  if (!site) return;
  document.querySelectorAll('#iam-industry-enquiry a').forEach(function (link) {
    var url = new URL(link.href);
    url.searchParams.set('ref_site', site);
    link.href = url.toString();
  });
})();
