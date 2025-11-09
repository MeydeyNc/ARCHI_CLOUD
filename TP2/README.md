# M1 ARCHI CLOUD


### Etape 1 : 

#### 1. API Flask 

```
# hello.py

from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/kenobi")
def kenobi():
    return jsonify({'message':'Hello there'})
```

#### 2. Conteneur 

```
# requirements.txt

Flask==1.1.2
Jinja2==2.11.2
Werkzeug==1.0.1
itsdangerous==1.1.0
MarkupSafe==1.1.1
```

```
# dockerfile

FROM python:3.8-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5000
CMD ["flask", "run", "--host=0.0.0.0"]
````

#### 3. Building 

Push de l'image perso michletech/flaskapi:1.5

Récup sur azure. 

Response sur /kenobi is OK. 

### Etape 2 : Exposer l'API

#### 1. Définir l'interface. 


Création de l'apim
```
az apim create --name apim-ouiouibaguette --resource-group TP2 --publisher-email mederic.marquie@ynov.com --publisher-name "Michel" --sku-name Developer --location francecentral
```

Création de l'api az : 
```
az apim api create \
  --resource-group $RG_NAME \
  --service-name $APIM_NAME \
  --api-id $API_ID \
  --display-name $DISPLAY_NAME \
  --path $API_SUFFIX \
  --service-url $SERVICE_URL \
  --protocols https \
  --api-type http
```

### Etape 3 : Création du site 

#### 1. Création de l'account storage : 

```
az storage account create \
  --name $AS_NAME \
  --resource-group $RG_NAME \
  --location $LOCATION \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot
```

ça fonctione : 

![image](https://hackmd.io/_uploads/HJGYWkYybg.png)


### Etape 4 : Distribuer le site via CDN

#### A. Création de l'Azure Front Door : 

```
az afd profile create \
--profile-name laporte \
--resource-group TP2 \ 
--sku Standard_AzureFrontDoor
```

MARCHE PAS parce que Msoft est tjrs pas beau. 

Passage sur Google Cloud : 

Création du Bucket storage : 
```
gcloud storage buckets create gs://$BUCKET_NAME --project=<VOTRE_PROJET_ID> --location=$REGION --default-storage-class=STANDARD
gcloud storage buckets update gs://$BUCKET_NAME --web-main-page-suffix index.html
````

Téléversage des fichiers pour le site statique. 


Création du Bucket backend : 
````
gcloud compute backend-buckets create $BACKEND_BUCKET_NAME \
  --gcs-bucket-name=$BUCKET_NAME \
  --enable-cdn \
  --project=<VOTRE_PROJET_ID>
````

Création du backend service externe pour relier azure : 
````
gcloud compute backend-services create $EXTERNAL_BACKEND_NAME \
  --protocol HTTPS \
  --global \
  --project=<VOTRE_PROJET_ID>
  
gcloud compute backend-services add-backend $EXTERNAL_BACKEND_NAME \
  --global \
  --project=<VOTRE_PROJET_ID> \
  --balancing-mode UTILIZATION \
  --external-endpoint $AZURE_API_HOST \
  --port-name https \
  --custom-request-headers 'Host: '$AZURE_API_HOST
````
Revirement de situation. 
On a continué sur GCloud. 

Voici les commandes de fin du TP sur GCloud. 

Création d'une IP publique pour l'API : 
````
gcloud compute addresses create lb-ip-address --global 
Created [https://www.googleapis.com/compute/v1/projects/tp2-de-la-baguette/global/addresses/lb-ip-address].
$ gcloud compute addresses describe lb-ip-address --global --format="value(address)"
34.160.84.32
````

On crée le backend bucket, son api, et son service : 
````
gcloud compute backend-buckets create backend-bucket-baguette --gcs-bucket-name=le-site-statique-baguette --enable-cdn 
Created [https://www.googleapis.com/compute/v1/projects/tp2-de-la-baguette/global/backendBuckets/backend-bucket-baguette].
NAME: backend-bucket-baguette
GCS_BUCKET_NAME: le-site-statique-baguette
ENABLE_CDN: True
$ 
$ gcloud compute network-endpoint-groups create api-neg --region=europe-west1 --network-endpoint-type=serverless --cloud-run-service=flask-api
Created [https://www.googleapis.com/compute/v1/projects/tp2-de-la-baguette/regions/europe-west1/networkEndpointGroups/api-neg].
Created network endpoint group [api-neg].
$ gcloud compute backend-services create apiWARNING: The following filter keys were not present in any resource : region
$ 
$ 
$ gcloud compute backend-services create api-backend --global 
Created [https://www.googleapis.com/compute/v1/projects/tp2-de-la-baguette/global/backendServices/api-backend].
````

On crée puis map l'url nécessaire : 
````
$ gcloud compute url-maps create my-url-baguette --default-backend-bucket=backend-bucket-baguette
Created [https://www.googleapis.com/compute/v1/projects/tp2-de-la-baguette/global/urlMaps/my-url-baguette].
NAME: my-url-baguette
DEFAULT_SERVICE: backendBuckets/backend-bucket-baguette
$ gcloud compute url-maps add-path-matcher my-url-baguette --path-matcher-name=api-matcher --default-backend-bucket=backend-bucket-baguette --backend-service-path-rules="/api/*=api-backend"
Updated [https://www.googleapis.com/compute/v1/projects/tp2-de-la-baguette/global/urlMaps/my-url-baguette].
````

Création du proxy : 
````
gcloud compute target-http-proxies create my-baguette-proxy --url-map=my-url-baguette
````


Création de la forwarding rule : 
```
$ gcloud compute forwarding-rules create forwarding-rule-1 --address=lb-ip-address --global --target-http-proxy=my-baguette-proxy --ports=80
Created [https://www.googleapis.com/compute/v1/projects/tp2-de-la-baguette/global/forwardingRules/forwarding-rule-1].
```
