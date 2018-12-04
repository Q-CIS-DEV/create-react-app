export default {
  title: 'TroodCoreProject',
  businessObjects: [
    {
      name: 'TroodCoreBusinessObjects',
      type: 'CUSTODIAN',
      models: {
      },
    },
  ],
  libraries: [
    {
      name: 'TroodCoreBusinessComponents',
    },
  ],
  services: {
    auth: {
      linkedObject: 'handyman',
    },
  },
  pages: [

  ],
  entityPages: {},
}
