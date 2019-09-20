# cloud-build-discord-webhook
More information 
https://cloud.google.com/cloud-build/docs/configure-third-party-notifications?hl=es-419

Deploy function

```sh
gcloud functions deploy subscribeCloudBuild --stage-bucket [PROJECT-ID_cloudbuild] --trigger-topic cloud-builds --runtime nodejs10 --project=[PROJECT_ID] 
```
