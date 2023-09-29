import  create from "zustand";
import { Chain } from "wagmi";



//@TODO strict typing
const useStore = create<any>((set, get) => ({
    network: null,
    updateNetwork: (network:any) => set(()=> ({network:network}))


}));

export default useStore;
