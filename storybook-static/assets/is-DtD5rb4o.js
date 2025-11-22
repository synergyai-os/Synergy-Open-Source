const t = typeof document < 'u',
	i = e();
function e() {
	return (
		t &&
		window?.navigator?.userAgent &&
		(/iP(ad|hone|od)/.test(window.navigator.userAgent) ||
			(window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent)))
	);
}
function s(n) {
	return n instanceof HTMLElement;
}
function o(n) {
	return n instanceof Element;
}
function a(n) {
	return n instanceof Element || n instanceof SVGElement;
}
function u(n) {
	return n.matches(':focus-visible');
}
function r(n) {
	return n !== null;
}
function c(n) {
	return n instanceof HTMLInputElement && 'select' in n;
}
export { t as a, a as b, u as c, o as d, r as e, c as f, i as g, s as i };
