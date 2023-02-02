pub struct ComponentTypeDescriptor {
    pub name: &'static str,
    pub display_name: &'static str,
    /// True if components of this type cannot be added or removed after a machine is created
    pub fixed_list: bool,
}
