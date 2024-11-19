let GH_NAME = 'ipverse';

export default {
  async fetch (request,env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/') return new Response( request.headers.get('cf-connecting-ip'), { status: 200 });

    const match = path.split('.json')[0].match(/(\d{1,6})/);
    let ASN = '45102';
    if (match) ASN = match[1];
    else return new Response('"无效的 ASN:1"', { status: 400 });

    GH_NAME = env.GH_NAME || GH_NAME;
    const ASN_URL = `https://raw.githubusercontent.com/ipverse/asn-ip/refs/heads/master/as/${ASN}/aggregated.json`;
    const response = await fetch(ASN_URL);
    if (!response.ok) return new Response('"无效的 ASN:2"', { status: 400 });
    
    const data = await response.json();
    console.log(data);
    
    if (path.endsWith('.json')) {
      return new Response(JSON.stringify(data, null, 4), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    } else {
      const ipv4Subnets = data.subnets.ipv4;
      const ipv4Text = ipv4Subnets.join('\n');
      let text = ipv4Text;
      if( (url.searchParams.has('6') && url.searchParams.has('4')) || url.searchParams.has('all') ){
        const ipv6Subnets = data.subnets.ipv6;
        const ipv6Text = ipv6Subnets.join('\n');
        if (ipv6Text) text += '\n' + ipv6Text;
      } else if( url.searchParams.has('6') ){
        const ipv6Subnets = data.subnets.ipv6;
        const ipv6Text = ipv6Subnets.join('\n');
        text = ipv6Text;
      }
      return new Response(text, { status: 200 });
    }
  }
}
