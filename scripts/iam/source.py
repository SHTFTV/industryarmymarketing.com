import hashlib
import ipaddress
import socket
import urllib.parse
import urllib.request
from html.parser import HTMLParser

class PublicRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        public_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def public_url(url):
    u = urllib.parse.urlsplit(url)
    if u.scheme != 'https' or not u.hostname or u.username or u.password or u.port not in (None,443):
        raise ValueError('Public HTTPS URL required')
    for address in socket.getaddrinfo(u.hostname, 443, type=socket.SOCK_STREAM):
        if not ipaddress.ip_address(address[4][0]).is_global:
            raise ValueError('Non-public source address')
    return url

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.ignore=0; self.parts=[]
    def handle_starttag(self, tag, attrs):
        if tag in ('script','style','noscript'): self.ignore += 1
    def handle_endtag(self, tag):
        if tag in ('script','style','noscript') and self.ignore: self.ignore -= 1
    def handle_data(self, data):
        if not self.ignore and data.strip(): self.parts.append(data.strip())

def fetch_source(url):
    public_url(url)
    opener = urllib.request.build_opener(PublicRedirect())
    with opener.open(urllib.request.Request(url,headers={'User-Agent':'IAM-Editorial/1.0 (+https://www.industryarmymarketing.com/)'}),timeout=30) as r:
        if r.status != 200: raise ValueError('Source HTTP failure')
        public_url(r.url)
        data = r.read(1_000_001)
        if len(data)>1_000_000: raise ValueError('Source too large')
        parser=Text(); parser.feed(data.decode('utf-8',errors='replace'))
        text=' '.join(parser.parts)[:40000]
        if len(text)<300: raise ValueError('Insufficient actual source text')
        return {'url':url,'finalUrl':r.url,'text':text,'sha256':hashlib.sha256(data).hexdigest()}
