import { Children } from "@/types";

export default function TableContainer({children} : Children){
    return <div className="rounded-lg overflow-hidden border">
        {children}
    </div>
}