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
