import { useRef, useState, useEffect } from 'react';
import { Column } from 'primereact/column';
import { Paginator, PaginatorPageChangeEvent } from 'primereact/paginator';
import { InputSwitch, InputSwitchChangeEvent } from 'primereact/inputswitch';
import { DataTable } from 'primereact/datatable';
import { OverlayPanel } from 'primereact/overlaypanel';
import axios from 'axios';
import PrimeReactOverlay from './PrimeReactOverlay';

interface DataFetched {
    id: string;
    title: string;
    place_of_origin: string;
    artist_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

interface ColumnMeta {
    field: string;
    header: string;
}

export default function DynamicColumnsDemo() {
    const [products, setProducts] = useState<DataFetched[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [first, setFirst] = useState<number>(0);
    const [rows, setRows] = useState<number>(10);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedProducts, setSelectedProducts] = useState<DataFetched[]>([]);
    const [rowClick, setRowClick] = useState<boolean>(true);
    const op = useRef<OverlayPanel>(null);
    const [inputRows, setInputRows] = useState<number>(rows);

    const columns: ColumnMeta[] = [
        { field: 'title', header: 'Title' },
        { field: 'place_of_origin', header: 'Place of Origin' },
        { field: 'artist_display', header: 'Artist Display' },
        { field: 'inscriptions', header: 'Inscriptions' },
        { field: 'date_start', header: 'Date Start' },
        { field: 'date_end', header: 'Date End' },
    ];

    const onPageChange = (e: PaginatorPageChangeEvent) => {
        setFirst(e.first);
        setRows(e.rows);
    };

    const applyRows = async () => {
        op.current?.hide();
        if (inputRows > 0) {
            const totalRequired = inputRows;
            let remaining = totalRequired;
            let page = first / rows + 1;
            let selectedRecords: DataFetched[] = [];

            while (remaining > 0) {
                try {
                    const res = await axios.get("https://api.artic.edu/api/v1/artworks", {
                        params: { page, limit: rows },
                    });

                    const fetchedProducts = res.data.data.map((item: any) => ({
                        id: item.id,
                        title: item.title || '',
                        place_of_origin: item.place_of_origin || '',
                        artist_display: item.artist_display || '',
                        inscriptions: item.inscriptions || '',
                        date_start: item.date_start || 0,
                        date_end: item.date_end || 0,
                    }));

                    const available = Math.min(fetchedProducts.length, remaining);
                    selectedRecords = [...selectedRecords, ...fetchedProducts.slice(0, available)];
                    remaining -= available;

                    if (remaining > 0 && res.data.pagination.total_pages > page) {
                        page++;
                    } else {
                        break;
                    }
                } catch (err) {
                    console.error("Error fetching additional records:", err);
                    break;
                }
            }

            setSelectedProducts(selectedRecords);
        } else {
            console.warn("Invalid inputRows value.");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const page = first / rows + 1;
                setLoading(true);

                const res = await axios.get("https://api.artic.edu/api/v1/artworks", {
                    params: { page, limit: rows },
                });

                const fetchedProducts = res.data.data.map((item: any) => ({
                    id: item.id,
                    title: item.title || 'No inscription available',
                    place_of_origin: item.place_of_origin || 'No inscription available',
                    artist_display: item.artist_display || 'No inscription available',
                    inscriptions: item.inscriptions || 'No inscription available',
                    date_start: item.date_start || 0,
                    date_end: item.date_end || 0,
                }));

                setProducts(fetchedProducts);
                setTotalRecords(res.data.pagination.total || 0);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [first, rows]);

    return (
        <div className="card p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="flex items-center mb-4 gap-2">
                <InputSwitch
                    inputId="input-rowclick"
                    checked={rowClick}
                    onChange={(e: InputSwitchChangeEvent) => setRowClick(e.target.value)}
                />
                <label htmlFor="input-rowclick" className="text-gray-700 font-medium">
                    Row Click
                </label>

                <PrimeReactOverlay applyRows={applyRows} inputRows={inputRows} setInputRows={setInputRows} op={op} />

            </div>

            {loading ? (
                <div className="w-full min-w-[80%] mx-auto space-y-3">
                    {[...Array(rows)].map((_, index) => (
                        <div
                            key={index}
                            className="w-full h-16 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 animate-pulse rounded-md border border-gray-200"
                        />
                    ))}
                </div>
            ) : (
                <DataTable
                    value={products }
                    tableStyle={{ minWidth: '50rem' }}
                    className="min-w-full border border-gray-200 rounded-md"
                    selectionMode={rowClick ? null : 'multiple'}
                    selection={selectedProducts || []}
                    onSelectionChange={(e: any) => setSelectedProducts(e.value)}
                    dataKey="id"
                >
                    {!rowClick && (
                        <Column headerClassName='bg-gray-300'
                            selectionMode="multiple"
                            headerStyle={{ width: '3rem' }}
                        />
                    )}

                    {columns.map((col) => (
                        <Column headerClassName='bg-gray-300  text-black font-semibold text-lg '
                            key={col.field}
                            field={col.field}
                            header={col.field === 'title' ? (
                                <span>
                                    <i
                                        className="pi pi-chevron-down mr-2 text-xl text-gray-500 cursor-pointer"
                                        onClick={(e) => op.current?.toggle(e)}
                                    ></i>
                                    {col.header}
                                </span>
                            ) : (
                                col.header
                            )}
                            
                        />
                    ))}
                </DataTable>
            )}

            <div className="mt-4">
                <Paginator
                    first={first}
                    rows={rows}
                    totalRecords={totalRecords}
                    rowsPerPageOptions={
                        
                        [10, 20, 30]}
                    onPageChange={onPageChange}
                />
            </div>
        </div>
    );
}
