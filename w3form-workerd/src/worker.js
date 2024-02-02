import {W3FormWorker, FileStorageW3up} from 'w3form-core'
import { getW3upClient } from './w3up.js'

export default W3FormWorker.create({
  files: await FileStorageW3up.create(getW3upClient())
})
