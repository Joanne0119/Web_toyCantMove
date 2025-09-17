import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import Slogan from '@/components/Slogan';
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

const EnterName = () => {
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    const handleEnter = () => {
        if (nickname.trim()) {
            localStorage.setItem('nickname', nickname);
            navigate('/choose-char');
        } else {
            // A non-blocking notification is better than alert()
            <Alert variant="destructive" className="max-w-md mx-auto mt-4">
                <AlertTitle>錯誤</AlertTitle>
                <AlertDescription>請輸入暱稱</AlertDescription>
            </Alert>
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen font-sans">
            <Slogan>不會動的玩具<br />才正常吧</Slogan>
            <div className="flex flex-col items-center gap-8 mt-48 text-center px-4">
                <label htmlFor="nickname" className="text-lg">請輸入您的暱稱</label>
                <input
                    id="nickname"
                    type="text"
                    placeholder="某某某"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-80 max-w-full h-12 text-xl text-center px-4 border-none rounded-full bg-gray-200"
                />
            </div>
            <div className="mt-48">
                <Button onClick={handleEnter}>確定</Button>
            </div>
        </div>
    );
};

export default EnterName