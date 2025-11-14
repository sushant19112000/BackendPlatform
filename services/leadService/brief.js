const prisma = require("../../db/dbConnection");

const addBrief = async (data) => {
    try {

       const formattedData={
            name:data.name,
            due:new Date(data.dueDate),
            dueTime:data.dueTime,
            arrivedOn:new Date(data.arrivedOnDate),
            arrivedOnTime:data.arrivedOnTime,
            status:data.status,
            type:data.type,
            leadDetails:data.leadDetails,
            leadDetailsSection:data.leadDetialsSection,
            remark:data.remark,
            briefHyperlink:data.briefHyperlink
       }

       
        const briefExists = await prisma.brief.findFirst({ where: { name: data.name } })
        if (briefExists) {
            return false;
        }
        const newBrief = await prisma.brief.create({ data: formattedData })
        return newBrief;
    }
    catch (e) {
        console.log(e);
    }
}


const editBrief = async (id, data) => {
  try {
    // If you want EXACTLY "data = data" logic:
    const updatedData = { ...data }; // 🔹 No transformations, just pass as-is

    // Check if brief exists
    const brief = await prisma.brief.findUnique({
      where: { id: Number(id) }
    });

    if (!brief) return false;

    // Update
    const updatedBrief = await prisma.brief.update({
      where: { id: Number(id) },
      data: updatedData
    });

    return updatedBrief;
  } catch (e) {
    console.log(e);
  }
};


const getBriefs = async (query = "query", filter = "status") => {
    try {
        let briefs;
        if (query == "query" && filter == "status") {
            briefs = await prisma.brief.findMany();
        }
        

        return briefs;
    }

    catch (e) {
        console.log(e);
    }
}

const getBrief = async (id) => {
    try {
        const brief = await prisma.brief.findFirst({ where: { id: id } });
        if (!brief) return false
        return brief;
    }
    catch (e) {
        console.log(e);
    }
}


module.exports = { getBrief, getBriefs, addBrief,editBrief };