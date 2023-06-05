const express=require("express")
const mongoose=require("mongoose")
const port=2023
const app=express()
app.use(express.json())
const electionSchma=new mongoose.Schema({
    state:String,
    parties:[String],
    result:{
       apc:Number,
       pdp:Number,
       lp:Number
    },
    collationOffice:String,
    isRigged:Boolean,
    total:Number
})
app.get("/",(req,res)=>{
    res.status(200).json({
        message:"welcome to my page",
    
    })
})
const user=mongoose.model("electionapi",electionSchma)
//creating a data in our database
app.post("/createuser",async(req,res)=>{
    const newResult=await new user(req.body)
  newResult.save()
    res.status(200).json (newResult)
})
//retrieving data
app.get("/getall",async(req,res)=>{
    const All=await user.find()
    res.status(200).json(
        {
            message:"the available users are "+All.length,
            data:All
        }
    )
})
//retrieve a single user
app.get("/getOne/:id",async(req,res)=>{
    const id=req.params.id
    const Oneuser=await user.findById(id)
    res.status(200).json(Oneuser
    )
})
//delete one
app.delete("/delete/:id",async(req,res)=>{
    const id=req.params.id
    const deleteuser=await user.findByIdAndDelete(id)
    res.status(200).json({
        message:`this info ${id} has been deleted`,
        data:deleteuser}
    )
});

app.put("/update/:id",async(req,res) =>{
    try{
        const id =req.params.id
        const oldData=await user.findById(id)
        const updateuser={
            state:req.body.state|| oldData.state,
            parties:req.body.parties|| oldData.parties,
            result:{
                apc:req.body.apc || oldData.apc,
                pdp:req.body.pdp || oldData.pdp,
                lp:req.body.lp || oldData.lp,
            },
            collationOffice:req.body.collationOffice|| oldData.collationOffice,
            isRigged:req.body.isRigged || oldData.isRigged,
            total:req.body.total || oldData.total
        }
        await user.updateOne(updateuser,{new:true});
        if(updateuser){
            res.status(200).json({
                message:`this ${id} has been updated`,
                data:updateuser
            })
        }else{
            res.status(400).json({
                error:"error updating user"
            })
        }
    }catch(error){
        res.status(400).json({
            message:error.message
        })
    }
})
//delete all 


// app.get("/getwinner/:id", async(req, res)=> {
//     try {
//         const getElectionDetails = await user.findById(req.params.id)

//         electionResult = getElectionDetails.result

//         let highestValue = -Infinity
//         let winningParty = null

//         for(const parties in electionResult){
//             const value = electionResult[parties]
            
//             if(value > highestValue){
//                 highestValue = value
//                 winningParty =parties
//             }
//         }
//         res.status(200).json({message: `The winner of the elelction is ${winningParty} with ${highestValue}`})
//     } catch (error) {
//         res.status(404).json({
//             message: error.message
//         })
//     }


// app.post("/getwinner", async (req,res)=>{
//     try {
//         // const state=req.param.state
//         // const newResult=await user.findone(state)
//         const newResult = await new user(req.body);
    
        
  
//        const  electionResult = newResult.result
  
//         let highestValue = -Infinity
//         let winningParty = null
  
//         for(const parties in electionResult){
//             const value = electionResult[parties]
            
//             if(value > highestValue){
//                 highestValue = value
//                 winningParty = parties
//             }
//         }
//         newResult.save()
//         res.status(200).json({message: `The winner of this state is ${winningParty} with ${highestValue}`, data:newResult})
//         // res.status(200).json(newResult)
//     } catch (error) {
//         res.status(404).json({
//             message: error.message
//         })
//     }
// }
// )
app.get("/winner/:state", async (req, res) => {
    try {
      const { state } = req.params;
      const electionResult = await user.findOne({ state });
  
      if (!electionResult) {
        res.status(404).json({
          error: "No election result found for the specified state.",
        });
      } else {
        const resultData = electionResult.result;
        let stateWinner = null;
        let highestVoteCount = null;
  
        for (const party in resultData) {
          if (resultData.hasOwnProperty(party)) {
            const voteCount = resultData[party];
            if (highestVoteCount === null || voteCount > highestVoteCount) {
              highestVoteCount = voteCount;
              stateWinner = party;
            }
          }
        }
  
        res.status(200).json({
          Message: `The winning party of this state is ${stateWinner}`,
          state,
          stateWinner,
        });
      }
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  })


app.get("/overallWinner", async (req, res) => {
    try {
      const allResults = await user.find();
      if (!allResults || allResults.length === 0) {
        res.status(404).json({
          error: "No election results found.",
        });
      } else {
        let overallResults = {};
        for (const result of allResults) {
          const resultData = result.result;
          for (const party in resultData) {
            if (resultData.hasOwnProperty(party)) {
              const voteCount = resultData[party];
              if (overallResults.hasOwnProperty(party)) {
                overallResults[party] += voteCount;
              } else {
                overallResults[party] = voteCount;
              }
            }
          }
        }
  
        let overallWinner = null;
        let highestVoteCount = null;
        for (const party in overallResults) {
          if (overallResults.hasOwnProperty(party)) {
            const voteCount = overallResults[party];
            if (highestVoteCount === null || voteCount > highestVoteCount) {
              highestVoteCount = voteCount;
              overallWinner = party;
            }
          }
        }
  
        res.status(200).json({
          message: `The general winner of the election is: ${overallWinner}`,
          overallWinner,
          result: overallResults,
        });
      }
    } catch (error) {
      res.status(400).json({
        error: error.message,
      });
    }
  });
  
  
  


mongoose.connect("mongodb+srv://preciouschita37:OLiBbFgDz9JdsclA@cluster0.xfxpksl.mongodb.net/")
.then(()=>{
   console.log("connection to database is successful")
})


app.listen(port,()=>{
    console.log(`server is listening to port  ${port}`)
})

