# w3form

Renders an HTML Form to allow a user to provide a UCAN delegation and a File to upload to web3.storage.

The server has a stable signer DID set via `W3_PRINCIPAL` in the env.

Optionally set `W3_PROOF` to predefine the delegation to use. This would allow _anyone_ to upload to your space!

## Usage

- pick a file to upload
- take note of the did of the w3form deployment (i.e. the public key).
- create a ucan delegation that allows uploads from that DID.
```shell
w3form=did:key:z6Mkh3tCjsGYAPMzxcyzGjqWAQ7XExNnV623ySwRh1wWDG8a`
w3 delegation create $w3form --can store/add --can upload/add > w3form.ucan.car
```
- in the form at that url, pick a file to upload for 'file'.
- for 'authorization' choose that `w3form.ucan.car`
- submit the form
- go look in the space that was active when you did w3 delegation create ... using w3 ls or using console.web3.storage
- try 
```shell
curl https://w3form.bengo.workers.dev/ -F authorization=@/private/tmp/space-delegation-1706918136.ucan.car -F file=@/private/tmp/benfile.jpg
```

## Credits

Shoutout to @vasco-santos. This uses his esbuild-plugin-w3up-client-wasm-import which worked great
