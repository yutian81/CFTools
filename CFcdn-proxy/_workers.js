export default {
    async fetch(request, env) {
        let url = new URL(request.url);
        if (url.pathname.startsWith('/')) {
            var arrStr = [
                'aaaa.bbbbb.hf.space',
            ];
            url.protocol = 'https:'
            url.hostname = getRandomArray(arrStr)
            let new_request = new Request(url, request);
            return fetch(new_request);
        }
        return env.ASSETS.fetch(request);
    },
};
function getRandomArray(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
