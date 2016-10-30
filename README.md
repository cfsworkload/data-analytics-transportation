# Workload - Data and Analytics Transportation


### Data and Analytics Transportation sample app


The Data and Analytics Transportation app demonstrates
a data analytics workflow that uses a combination of Bluemix and open source applications to create a visualization of information.
The data is retrieved from a transportation system in Madrid, filtered and then saved in Object Storage. The information is then analyzed, and the results are presented in a Node-RED Freeboard.


## Introduction

After registering for Bluemix and DevOps Services, you can deploy the Data and Analytics Transportation app (DAT) into your personal DevOps space.

## Sign up and log into Bluemix and DevOps

Sign up for Bluemix at https://console.ng.bluemix.net and DevOps Services at https://hub.jazz.net.
When you sign up, you'll create an IBM ID, create an alias, and register with Bluemix.


## Make sure a Public IP is available in your Bluemix space

This solution requires a free public IP. In order to determine if a public IP is available, you will need to find the number of  used and your max quota of IP addresses allowed for your space.
To find this information, follow these steps:

1. Log into your Dashboard at https://console.ng.bluemix.net.
2. Select **DASHBOARD**.
3. Select the space you where you would like DAT to deploy.
4. In the **Containers** tile you will see information about your IP addresses.
5. Check that the **Public IPs Requested** field has at least one available IP address.

If you have an IP address available, you are ready to Deploy to Bluemix. If all of your public IP addresses have been used, you will need to release one prior to deploying. In order to release a public IP, install the CF IC plugin, which can be found at the website below.

https://www.ng.bluemix.net/docs/containers/container_cli_ov.html#container_cli_cfic_install

Once installed:

1. Log into your Bluemix account and space.
```
cf login
```
2. Initialize your IBM Containers CLI.
```
cf ic login
```
3. List your current external IP addresses.
```
cf ic ip list
```
4. Release an IP address.
```
cf ic ip release < public IP >
```


## Deploy to Bluemix

Click the **Deploy to Bluemix** button below to deploy the source code to DevOps Services. This creates the needed Cloud Foundry and Container applications as well as instances of Object-Storage, Cloudant, and Spark. These instances are then bound to your application. **Note: The service plan for Spark may have additional monthly charges.**

 [![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/cfsworkload/data-analytics-transportation)

After the pipeline has been configured, you can monitor the deployment by following these steps:

1. Select your newly created project in DevOps Services.
2. Go to **MY PROJECTS**.
3. Select **BUILD & DEPLOY**.
4. You can monitor the stages by selecting **View logs and history**.
5. After configuring an access key (see note below), press **Run Stage** for **Cloud Foundry Deploy** to continue deployment.

**NOTE:** The deployment would stop and wait for an access key to the map service. After aquiring an access key:

stage **Cloud Foundry Deploy** -> **Stage Configuration** -> **Configure Stage** -> **Environment Properties** tab -> insert your mapquest access key.
To register to mapquest map services: https://developer.mapquest.com/plan_purchase/steps/business_edition/business_edition_free/register

## Set up Object Storage

Download data schemas from the IDS project and upload them to your container. The schemas define what information Secor pulls from Kafka and allow Spark to read the stored data.

1. Go to your project in DevOps Services, and download **secor/DataServices.metaKeys** and **secor/DataServices.schema** to your local machine.
2. From your application's dashboard select **DAT-objectstorage**.
3. From the **Actions** drop down menu, select **Add Container** and name it **secorSchema**.
4. Create another container and name it **DataServices**.
5. Select your **secorSchema** container, and from the **Actions** drop down menu, select **Add File**.

	-  Select the **DataServices.metaKeys** file you downloaded to your local machine.
	-  Select the **DataServices.schema** file you downloaded to your local machine.


## Add your Object Storage and IPython notebook to Spark

To complete Spark configuration, add your Object Storage and IPython notebook to the service.

1. In DevOps Services, select your project and download **dat_notebook.ipynb** to your local machine.
2. Inside the **Spark** service, click **Open** at the top right.
3. Select your newly created **DAT-spark** instance.
4. Click **NOTEBOOKS** and at the top select **Object Storage** and select **Add Object StorageE**.
5. Select **Bluemix** at the top.
6. Select **DAT-objectstorage** from the options. Select the container **DataServices** and press **SELECT**.
7. Click **My Notebooks** at the top and select **New Notebook**.
8. Select **From File** at the top. Name the notebook and give it a description.
9. Click on **Choose File** and select the **dat_notebook.ipynb** downloaded to your local machine.
10. Select **Create Notebook**.


## Set up Message Hub credentials in Node-RED

Add the API key of your Message Hub service to Node-RED.

1. Obtain the **API key**: goto Bluemix project Dashboard ->  Message Hub service tile -> click on **show credentials** dropdown ->  copy ```api_key```  
2. Return to your cf application's dashboard and click the route at the top of the page to launch the Node-RED website.
3. Click **Go to your Node-RED flow editor**. Once there, you will see the customized flow.
4. Double click on the **messgehub out** node at the far right to edit the messgehub producer node -> insert your **API key**
5. Double click on the **messgehub in** node at the far left to edit the messgehub consumer node -> insert your **API key**
6. Click **OK** to close the window.
7. Click **Deploy** at the upper right to deploy the updated flow to Node-RED.


#### Start the Apache Spark script

1. obtain Message Hub **user** and **password**: goto Bluemix project Dashboard ->  Message Hub service tile -> click on **show credentials** dropdown ->  copy ```user``` and ```password```
2. Go to the project in your Bluemix Dashboard, and choose **Apache Spark**.
3. Click **OPEN** and select your Apache Spark instance.
4. Click on the notebook you created.
5. Update the variables "MSGHUB_USERNAME" and "MSGHUB_PASSWORD" to your own Message Hub **user** and **password**.
6. Click **Play** at the top.


## Access Freeboard from Node-RED

Once the data is processed, you will be able to see a visual representation of real-time traffic information displayed in a Node-RED Freeboard. The information on the Freeboard is collected from three separate areas of Madrid and the three data points are simultaneously displayed. You are able to see the live feed from traffic cameras, as well as, the speed and intensity of traffic and their analyzed thresholds.

1. Return to your Cloud Foundry's application dashboard and select the route for your application to access Node-RED.
2. Click **Go to your Freeboard dashboard** to load your newly configured Freeboard.

  ![EXAMPLE](images/loaded_freeboard.png)

## Reference

The Data and Analytics Transportation sample app combines several different Bluemix and open source applications.

##### Open source

Secor: a reliable logging service that takes information from Kafka and converts it into parquet files. Those files are then placed into Object Storage within Bluemix.

##### Bluemix

Apache Spark: a data processing engine.

Message Hub: kafka based message bus service.

IPython: an interactive computational environment where you can combine coding, text, math, and media.

Node-RED: a tool for wiring together the Internet of Things.

Node-RED Freeboard: a data visualization dashboard.

Object Storage: uses unique ID's and containers to store information in a scalable way.
