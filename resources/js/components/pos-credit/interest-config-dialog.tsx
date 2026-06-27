import {
    ITEM_TYPES,
    PAYMENT_TERMS,
    type InterestConfigMap,
} from '@/components/pos-credit/credit-calculations';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Settings } from 'lucide-react';

interface InterestConfigDialogProps {
    open: boolean;
    interestConfigs: InterestConfigMap;
    tempInterestConfigs: InterestConfigMap;
    lcpMarkupRate: number;
    lcpAdditionalCharge: number;
    tempLcpMarkupRate: number;
    tempLcpAdditionalCharge: number;
    onOpenChange: (open: boolean) => void;
    onTempInterestConfigsChange: (configs: InterestConfigMap) => void;
    onTempLcpMarkupRateChange: (value: number) => void;
    onTempLcpAdditionalChargeChange: (value: number) => void;
    onUpdateInterestConfig: (
        itemType: keyof InterestConfigMap,
        term: number,
        field: 'multiplier' | 'fixedCharge',
        value: string,
    ) => void;
    onReset: () => void;
    onSave: () => void;
}

export function InterestConfigDialog({
    open,
    interestConfigs,
    tempInterestConfigs,
    lcpMarkupRate,
    lcpAdditionalCharge,
    tempLcpMarkupRate,
    tempLcpAdditionalCharge,
    onOpenChange,
    onTempInterestConfigsChange,
    onTempLcpMarkupRateChange,
    onTempLcpAdditionalChargeChange,
    onUpdateInterestConfig,
    onReset,
    onSave,
}: InterestConfigDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Interest Rate & LCP Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure LCP markup, interest multipliers and fixed
                        charges for different item types and terms
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                LCP (Loan Contract Price) Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure how the Loan Contract Price is
                                calculated from SRP
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="lcpMarkupRate">
                                    LCP Markup Rate
                                </Label>
                                <Input
                                    id="lcpMarkupRate"
                                    type="number"
                                    step="0.01"
                                    value={tempLcpMarkupRate}
                                    onChange={(event) =>
                                        onTempLcpMarkupRateChange(
                                            parseFloat(event.target.value) ||
                                                1.0,
                                        )
                                    }
                                    placeholder="e.g., 1.1"
                                />
                                <p className="text-xs text-muted-foreground">
                                    SRP will be multiplied by this value
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lcpAdditionalCharge">
                                    LCP Additional Charge (₱)
                                </Label>
                                <Input
                                    id="lcpAdditionalCharge"
                                    type="number"
                                    step="50"
                                    value={tempLcpAdditionalCharge}
                                    onChange={(event) =>
                                        onTempLcpAdditionalChargeChange(
                                            parseFloat(event.target.value) || 0,
                                        )
                                    }
                                    placeholder="e.g., 300"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Additional fixed amount added to marked-up
                                    SRP
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    <Tabs defaultValue="furniture" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            {ITEM_TYPES.map((itemType) => (
                                <TabsTrigger key={itemType} value={itemType}>
                                    {itemType[0].toUpperCase() +
                                        itemType.slice(1)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {ITEM_TYPES.map((itemType) => (
                            <TabsContent
                                key={itemType}
                                value={itemType}
                                className="space-y-4"
                            >
                                <div className="grid gap-4">
                                    {PAYMENT_TERMS.map((term) => (
                                        <Card key={term}>
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base">
                                                    {term} Months Term
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                                <ConfigInput
                                                    id={`${itemType}-${term}-multiplier`}
                                                    label="Interest Multiplier"
                                                    value={
                                                        tempInterestConfigs[
                                                            itemType
                                                        ][term].multiplier
                                                    }
                                                    step="0.01"
                                                    helper="PNV will be multiplied by this value"
                                                    onChange={(value) =>
                                                        onUpdateInterestConfig(
                                                            itemType,
                                                            term,
                                                            'multiplier',
                                                            value,
                                                        )
                                                    }
                                                />
                                                <ConfigInput
                                                    id={`${itemType}-${term}-fixed`}
                                                    label="Fixed Charge (₱)"
                                                    value={
                                                        tempInterestConfigs[
                                                            itemType
                                                        ][term].fixedCharge
                                                    }
                                                    step="50"
                                                    helper="Additional fixed amount added to PNV"
                                                    onChange={(value) =>
                                                        onUpdateInterestConfig(
                                                            itemType,
                                                            term,
                                                            'fixedCharge',
                                                            value,
                                                        )
                                                    }
                                                />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm">
                                        <strong>LCP Formula:</strong> LCP = (SRP
                                        × {tempLcpMarkupRate}) + ₱
                                        {tempLcpAdditionalCharge}
                                        <br />
                                        <strong>PNV Formula:</strong> Final PNV
                                        = (PNV × Multiplier) + Fixed Charge
                                        <br />
                                        <strong>Example:</strong> If PNV is
                                        ₱10,000, multiplier is 1.12, and fixed
                                        charge is ₱300:
                                        <br />
                                        Final PNV = (₱10,000 × 1.12) + ₱300 =
                                        ₱11,500
                                    </AlertDescription>
                                </Alert>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onReset}>
                        Reset to Defaults
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onTempInterestConfigsChange(interestConfigs);
                            onTempLcpMarkupRateChange(lcpMarkupRate);
                            onTempLcpAdditionalChargeChange(
                                lcpAdditionalCharge,
                            );
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onSave}>Save Configuration</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ConfigInput({
    id,
    label,
    value,
    step,
    helper,
    onChange,
}: {
    id: string;
    label: string;
    value: number;
    step: string;
    helper: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type="number"
                step={step}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="e.g., 1.12"
            />
            <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
    );
}
