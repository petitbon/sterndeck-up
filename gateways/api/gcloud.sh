gcloud services enable apigateway.googleapis.com
gcloud services enable servicemanagement.googleapis.com
gcloud services enable servicecontrol.googleapis.com

gcloud iam service-accounts create api-gateway
gcloud projects add-iam-policy-binding sterndeck-4 --member "serviceAccount:api-gateway@sterndeck-4.iam.gserviceaccount.com" --role "roles/run.invoker"
gcloud projects add-iam-policy-binding sterndeck-4 --member "serviceAccount:api-gateway@sterndeck-4.iam.gserviceaccount.com" --role "roles/iam.serviceAccountUser"

# CREATE API GATEWAY
gcloud api-gateway apis create sterndeck-api-4 --project=sterndeck-4
gcloud api-gateway api-configs create sterndeck-api-4-v001 --api=sterndeck-api-4 --openapi-spec=openapi2-run.yaml --project=sterndeck-4 --backend-auth-service-account=api-gateway@sterndeck-4.iam.gserviceaccount.com
gcloud api-gateway gateways create sterndeck-api-gateway-4 --api=sterndeck-api-4 --api-config=sterndeck-api-4-v001 --location=us-central1 --project=sterndeck-4

# CREATE API LOAD BALANCER
gcloud beta compute network-endpoint-groups create serverless-neg-sterndeck-api-4 --region=us-central1 --network-endpoint-type=serverless --serverless-deployment-platform=apigateway.googleapis.com --serverless-deployment-resource=sterndeck-api-gateway-4
gcloud compute backend-services create backend-service-sterndeck-api-4 --global
gcloud compute backend-services add-backend backend-service-sterndeck-api-4 --global --network-endpoint-group=serverless-neg-sterndeck-api-4 --network-endpoint-group-region=us-central1
gcloud compute url-maps create url-map-sterndeck-api-4 --default-service backend-service-sterndeck-api-4
gcloud compute ssl-certificates create sterndeck-api-4-ssl-cert --domains api-dev.sterndeck.com
gcloud compute target-https-proxies create https-proxy-sterndeck-api-4 --ssl-certificates=sterndeck-api-4-ssl-cert --url-map=url-map-sterndeck-api-4 
gcloud compute forwarding-rules create forwarding-rule-sterndeck-api-4 --target-https-proxy=https-proxy-sterndeck-api-4 --global --ports=443


# API KEYS
gcloud services enable sterndeck-api-4-1gtdardn9kai6.apigateway.sterndeck-4.cloud.goog


## UPDATE CONFIGS
gcloud api-gateway api-configs create sterndeck-api-4-v004 --api=sterndeck-api-4 --openapi-spec=openapi2-run.yaml --project=sterndeck-4 --backend-auth-service-account=api-gateway@sterndeck-4.iam.gserviceaccount.com  && gcloud api-gateway gateways update sterndeck-api-gateway-4 --api=sterndeck-api-4 --api-config=sterndeck-api-4-v004 --location=us-central1
