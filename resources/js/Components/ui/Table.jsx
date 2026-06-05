import React from 'react';

export default function Table({ columns = [], data = [] }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        {columns.map((col, i) => (
                            <th key={i} className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-2 text-sm text-gray-600 border-b">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}