export default async function createAppDataMetafields(data) {

  let query = `mutation CreateAppDataMetafield($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            key
            namespace
            type
            value
          }
          userErrors {
            field
            message
            code
          }
        }
      }`

  let variables = {
    variables: {
      "metafields":
      {
        "key": data.key,
        "namespace": data.namespace,
        "ownerId": data.ownerId,
        "type": data.type,
        "value": data.value
      }
    },
  }

  return { query: query, variables: variables }
};


export async function getAllAppDataMetafields(limit) {
  let query = `query {
              app {
                id
                installation {
                  metafields(first: ${limit}) {
                    edges {
                      node {
                        id
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
            }`

  return await query
};


export async function getOneAppDataMetafield(data) {
  let query = `query {
                    app {
                      id
                      installation {
                        metafield(key: "${data.namespace}.${data.key}") {
                              id
                              namespace
                              key
                              value
                        }
                      }
                    }
                  }`

  return await query
};


export async function deleteAppDataMetafield(data) {
  let query = {
    "query": `mutation metafieldDelete($input: MetafieldDeleteInput!) {
        metafieldDelete(input: $input) {
          deletedId
          userErrors {
            field
            message
          }
        }
      }`,
    "variables": {
      "input": {
        "id": data.id
      }
    },
  }

  return await query
};


