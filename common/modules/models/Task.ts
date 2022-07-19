import mongoose, { Schema, ObjectId } from 'mongoose'

export interface ITask {
  _id?: string
  name: string
  creator?: ObjectId | string
  desription?: string
  domain: string
  address: IAddress
  category: string
  dateofcreate: Date
  deadline: string
  customer?: string
  taskexecutors: [ItaskExecutors]
}

export interface ICreateTask {
  name: string
  creator: ObjectId | string
  desription?: string
  address: IAddress
  category: string
  dateofcreate: Date
  deadline: string
  customer?: string
}

export interface IAddress {
  name: string
  geoCode: IGeoCode
}

export interface IGeoCode {
  lat: number
  lng: number
}

export interface ItaskExecutors {
  workerid: ObjectId | string //profile photo and rating will be obtained from this id
  taskId: ObjectId | string
  price: number | string
  description: string
  workerdeadline?: Date
}

export interface ITaskModel {
  _id?: ObjectId
  name: string
  creator: ObjectId | string
  domain: string
  desription?: string
  address: IAddress
  category: string
  dateofcreate: Date
  deadline: string
  customer?: string
  taskexecutors: [ItaskExecutors]
}

const TaskSchema = new Schema<ITaskModel>({
  name: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  desription: { type: String, default: 'no description' },
  address: { type: Object, required: true },
  domain: { type: String },
  category: { type: String },
  dateofcreate: { type: Date, required: true, default: Date.now },
  deadline: { type: String, required: true },
  customer: { type: String },
  taskexecutors: [{ type: Object }],
})

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema)
export default Task
