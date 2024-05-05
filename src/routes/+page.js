export const load = async ({ fetch }) => {
    const response = await fetch('http://localhost:5173/final_data_normalized.json')
    const jsonData = await response.json()
    
    return {jsonData};
}



