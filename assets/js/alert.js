export default class Alert {

    constructor() {
        this.alertContainer = null;
    }

    init = () => {
        if(document.querySelector('.alert')) {
            this.alertContainer = document.querySelector('.alert');
        } else {
            this.alertContainer = document.createElement('div');
            this.alertContainer.classList.add('alert');
            document.body.prepend(this.alertContainer);
        }
    }

    show = (message, type) => {
        
        this.init();

        const span = document.createElement('span');
        span.id = 'alert-message';
        span.innerHTML = this.icon(type) + ' ' + message;

        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = '<i class="fas fa-close"></i>';
        button.addEventListener('click', () => {
            this.dismiss();
        });

        this.alertContainer.appendChild(span);
        this.alertContainer.appendChild(button);

        // Animation for showing the alert
        requestAnimationFrame(() => {
            this.alertContainer.classList.add('alert-visible',`alert-${type}`);
        });

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if(this.alertContainer.classList.contains('alert-visible')) {
                this.dismiss();
            }
        }, 5000);
    }

    dismiss = () => {
        this.alertContainer.classList.remove('alert-visible');
        this.alertContainer.classList.add('alert-hidden');
        this.alertContainer.addEventListener('transitionend', () => {
            this.alertContainer.classList.remove('alert-hidden', 'alert-success', 'alert-error');
            this.alertContainer.remove();
        }, { once: true });
    }

    icon = (type) => {
        switch(type) {
            case 'success':
                return '<i class="fas fa-check"></i>';
            case 'error':
                return '<i class="fas fa-circle-xmark"></i>';
            default:
                return '';
        }
    }

    success  = (message) => {
        this.show(message, 'success');
    }

    error = (message) => {
        this.show(message, 'error');
    }

}
