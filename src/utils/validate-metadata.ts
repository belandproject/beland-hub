import metadataSchema from '../metadata/schema.json';
import {Validator} from 'jsonschema'

var v = new Validator();


export async function validateMetadata(instance) {
    const valRes = await v.validate(instance, metadataSchema as any)
    if (instance.attributes) {
      for (let attr of instance.attributes){
        if (attr.max_value > 0) {
          if (typeof attr.value != "number") {
            valRes.addError("invalid attribute value");
            continue;
          }
          if (attr.value > attr.max_value) {
            valRes.addError("max_value must be greater than more value");
            continue;
          }
        }
      }
    }
    return valRes;
  }
  