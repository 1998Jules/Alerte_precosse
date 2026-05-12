"""
Formulaires pour les prix du marché
"""
from django import forms
from .models import MarketPrice


class MarketPriceForm(forms.ModelForm):
    """Formulaire pour les prix du marché"""
    
    class Meta:
        model = MarketPrice
        fields = [
            'product', 'category', 'price', 'currency', 'unit',
            'trend', 'market', 'location', 'availability', 'quality',
            'supplier', 'origin', 'notes'
        ]
        widgets = {
            'product': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nom du produit (ex: Riz, Maïs, Manioc)'
            }),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'min': '0',
                'placeholder': '0.00'
            }),
            'currency': forms.Select(attrs={'class': 'form-select'}),
            'unit': forms.Select(attrs={'class': 'form-select'}),
            'trend': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '+15%, -5%, 0%'
            }),
            'market': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Marché central, Grand marché...'
            }),
            'location': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Localisation précise'
            }),
            'availability': forms.Select(attrs={'class': 'form-select'}),
            'quality': forms.Select(attrs={'class': 'form-select'}),
            'supplier': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nom du fournisseur'
            }),
            'origin': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Origine du produit'
            }),
            'notes': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 3,
                'placeholder': 'Notes additionnelles...'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['product'].required = True
        self.fields['price'].required = True
        self.fields['market'].required = True
        self.fields['category'].required = True
    
    def clean_trend(self):
        """Valider le format de la tendance"""
        trend = self.cleaned_data.get('trend', '')
        if trend and not (trend.startswith('+') or trend.startswith('-') or trend == '0%'):
            raise forms.ValidationError(
                'La tendance doit commencer par +, - ou être "0%"'
            )
        return trend