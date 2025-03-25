
import FingerprintJS from 'https://openfpcdn.io/fingerprintjs/v3';

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (id) {
  FingerprintJS.load().then(fp => fp.get()).then(result => {
    fetch('/api/fingerprint?id=' + id, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
  });
}
