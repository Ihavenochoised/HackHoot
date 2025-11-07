var e = () => {
	try {
		let t = document.createElement('label');
		t.ariaHidden = 'true';
		t.style.display = 'none';
		let c = document.createElement('input');
		c.type = 'checkbox';
		c.setAttribute('switch', '');
		t.appendChild(c);
		document.head.appendChild(t);
		t.click();
		document.head.removeChild(t);
		navigator.vibrate?.(50);
	} catch (e) {
		console.error(e);
	}
};
e.confirm = () => {
	e();
	setTimeout(() => e(), 120);
};
e.error = () => {
	e();
	setTimeout(() => e(), 120);
	setTimeout(() => e(), 240);
};
export { e as haptic };
