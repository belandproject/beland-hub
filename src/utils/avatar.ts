import AvatarJSONSchema from '../metadata/avatar-schema.json';
import { Validator } from 'jsonschema';
const v = new Validator();

export async function validateProfileAvatar(instance) {
  return v.validate(instance, AvatarJSONSchema as any);
}
