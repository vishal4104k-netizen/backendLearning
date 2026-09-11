import mongoose, {model, Schema} from "mongoose"


const subscriptionSchema = new Schema({
    subscriber :{
        typr: Schema.Types.ObjectId,
        ref: "User"
    },
    channal : {
        typr: Schema.Types.ObjectId,
        ref: "User"
    }

}, {
    timestamps : true
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)