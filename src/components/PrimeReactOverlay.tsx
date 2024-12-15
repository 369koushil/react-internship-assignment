
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputNumber } from 'primereact/inputnumber';
const PrimeReactOverlay = (props:any) => {
  return (
   <OverlayPanel ref={props.op}>
                       <div className="p-4">
                           <label htmlFor="num-records" className="block text-sm font-medium text-gray-700 mb-2">
                               Number of Records
                           </label>
                           <InputNumber
                               id="num-records"
                               value={props.inputRows}
                               onValueChange={(e) => props.setInputRows(e.value || 10)}
                               showButtons
                               min={1}
                               max={100}
                               className="w-full"
                           />
                           <button
                               onClick={props.applyRows}
                               className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                           >
                            Submit
                           </button>
                       </div>
                   </OverlayPanel>
  )
}

export default PrimeReactOverlay
