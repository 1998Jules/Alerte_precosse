"""
Formulaires pour les alertes
"""
from django import forms
from .models import Alert


class AlertForm(forms.ModelForm):
    """Formulaire pour les alertes"""
    
    class Meta:
        model = Alert
        fields = [
            'title', 'description', 'type', 'level', 'status',
            'location', 'contact_email', 'contact_phone'
        ]
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Titre de l\'alerte'
            }),
            'description': forms.Textarea(attrs={
                'class': 'form-control',
                'rows': 4,
                'placeholder': 'Description détaillée de l\'alerte'
            }),
            'type': forms.Select(attrs={'class': 'form-select'}),
            'level': forms.Select(attrs={'class': 'form-select'}),
            'status': forms.Select(attrs={'class': 'form-select'}),
            'location': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Localisation (ex: Centre-ville, Zone nord...)'
            }),
            'contact_email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'email@exemple.com'
            }),
            'contact_phone': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': '+228 XX XX XX XX'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['description'].required = True
        self.fields['type'].required = True
        self.fields['level'].required = True