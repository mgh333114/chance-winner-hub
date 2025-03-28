
import React from 'react';
import { usePayment } from '@/context/PaymentContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, ZapOff, DollarSign } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AccountType } from '@/hooks/useBalance';

const AccountTypeToggle = () => {
  const { accountType, switchAccountType, isDemoAccount } = usePayment();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [targetAccountType, setTargetAccountType] = React.useState<AccountType>('real');

  const handleAccountTypeSwitch = (type: AccountType) => {
    setTargetAccountType(type);
    setShowConfirm(true);
  };

  const confirmSwitch = async () => {
    await switchAccountType(targetAccountType);
    setShowConfirm(false);
  };
  
  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={isDemoAccount ? "default" : "outline"}
          size="sm"
          onClick={() => handleAccountTypeSwitch('demo')}
          className={`flex items-center ${isDemoAccount ? 'bg-amber-500 hover:bg-amber-600' : 'text-amber-600'}`}
        >
          <ZapOff className="w-4 h-4 mr-1" />
          Demo Account
        </Button>
        
        <Button
          variant={!isDemoAccount ? "default" : "outline"}
          size="sm"
          onClick={() => handleAccountTypeSwitch('real')}
          className={`flex items-center ${!isDemoAccount ? 'bg-green-500 hover:bg-green-600' : 'text-green-600'}`}
        >
          <DollarSign className="w-4 h-4 mr-1" />
          Real Account
        </Button>
      </div>
      
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
              Switch to {targetAccountType === 'demo' ? 'Demo' : 'Real'} Account?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {targetAccountType === 'demo' 
                ? "You'll be using simulated funds for practice. No real money will be used or won in demo mode."
                : "You'll be switching to your real account. Any deposits or purchases will involve real money."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch}>
              Confirm Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AccountTypeToggle;
