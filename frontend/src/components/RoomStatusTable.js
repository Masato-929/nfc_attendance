import React from 'react';

const RoomStatusTable = ({ status }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>ユーザー名</th>
                    <th>部屋名</th>
                </tr>
            </thead>
            <tbody>
                {status.map((item, index) => (
                    <tr key={index}>
                        <td>{item.username}</td>
                        <td>{item.room_name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default RoomStatusTable;