// main.bicep
param location string = resourceGroup().location
param appName string = 'finance-tracker-${uniqueString(resourceGroup().id)}'
param dbAdminLogin string = 'adminuser'
@secure()
param dbAdminPassword string

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'F1' // Free tier for demo
    tier: 'Free'
  }
}

// App Service
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${appName}-app'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|8.0'
    }
  }
}

// Azure Database for PostgreSQL (Flexible Server)
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: '${appName}-db'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '13'
    administratorLogin: dbAdminLogin
    administratorLoginPassword: dbAdminPassword
    storage: {
      storageSizeGB: 32
    }
  }
}

// Service Bus Namespace
resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: '${appName}-sb'
  location: location
  sku: {
    name: 'Basic'
  }
}

// Service Bus Queue
resource notificationsQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: 'notifications'
}
