export const fetchSubgraphData = async () => {
    const resp = await fetch("https://api.studio.thegraph.com/query/36521/daredrop/version/latest");
    return resp;


}
