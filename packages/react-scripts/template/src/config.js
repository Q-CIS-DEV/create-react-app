export default {
  title: 'TroodCoreProject',
  businessObjects: [
    {
      name: 'TroodCoreBusinessObjects',
      type: 'CUSTODIAN',
      models: {},
    },
  ],
  libraries: [
    {
      name: 'TroodCoreComponents',
    },
  ],
  services: {
    auth: {},
    locale: {
      availableLocales: [
        {
          code: 'en',
          name: 'Eng',
        },
      ],
      defaultLocale: 'en',
    },
  },
  pages: [],
  entityPages: {},
}
