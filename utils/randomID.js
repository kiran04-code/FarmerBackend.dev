export const  getrandomId = ()=>{
   const chars = '5151515151DC5SDC1D5CD15CD1SC4DS1C5SD84V8DF4VF85V1F8V4E158ERFBRTBTRH1T565H1551GTR5G15GT1G8T8T4H8T4HT8H451BR5R15VD1VDCEFRREYJTNH51151884G84T84HTE4TH84RH84HYH';
   let id = ''
   for(let  i =0; i<4; i++){
    const Randomindex = Math.floor(Math.random()*chars.length)
    id+=chars[Randomindex]
   }
 return id 
}

const data = getrandomId()

console.log(data)